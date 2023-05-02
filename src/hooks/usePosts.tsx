import React, { useEffect } from "react";
import { Post, PostVote, postState } from "reddit-clone/atoms/PostAtom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { auth, firestore, storage } from "reddit-clone/firebase/clientApp";
import { deleteObject, ref } from "firebase/storage";
import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	query,
	where,
	writeBatch,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { communityState } from "reddit-clone/atoms/communitiesAtom";
import { authModalState } from "reddit-clone/atoms/AuthModalAtom";
import { useRouter } from "next/router";

const usePosts = () => {
	const [user] = useAuthState(auth);
	const router = useRouter();
	const [postStateValue, setPostStateValue] = useRecoilState(postState);
	const currentCommunity = useRecoilValue(communityState).currentCommunity;
	const setAuthModalState = useSetRecoilState(authModalState);

	const onVote = async (
		event: React.MouseEvent<SVGElement, MouseEvent>,
		post: Post,
		vote: number,
		communityId: string
	) => {
		event.stopPropagation();
		//check for user, open auth modal if it doesnt exist
		if (!user?.uid) {
			setAuthModalState({ open: true, view: "login" });
			return;
		}

		const { voteStatus } = post;
		const existingVote = postStateValue.postVotes.find(
			(vote) => vote.postId === post.id
		);
		try {
			let voteChange = vote;
			const batch = writeBatch(firestore);
			const updatedPost = { ...post };
			const updatedPosts = [...postStateValue.posts];
			let updatedPostVotes = [...postStateValue.postVotes];

			//voto nuevo
			if (!existingVote) {
				//crear nuevo documento postVote
				const postVoteRef = doc(
					collection(firestore, "users", `${user?.uid}/postVotes`)
				);
				const newVote: PostVote = {
					id: postVoteRef.id,
					postId: post.id!,
					communityId,
					voteValue: vote, //1 o -1
				};

				batch.set(postVoteRef, newVote);

				//sumar o restar 1 de post.voteStatus
				updatedPost.voteStatus = voteStatus + vote;
				updatedPostVotes = [...updatedPostVotes, newVote];
			}
			//voto existente
			else {
				const postVoteRef = doc(
					firestore,
					"users",
					`${user?.uid}/postVotes/${existingVote.id}`
				);

				//sacar voto (up => neutral OR down => neutral)
				if (existingVote.voteValue === vote) {
					//sumar o restar 1 de post.voteStatus
					updatedPost.voteStatus = voteStatus - vote;
					updatedPostVotes = updatedPostVotes.filter(
						(vote) => vote.id !== existingVote.id
					);
					// borrar documento postVote
					batch.delete(postVoteRef);
					voteChange *= -1;
				}
				//cambiar voto (down => up OR up => down)
				else {
					//sumar o restar 2 de post.voteStatus
					updatedPost.voteStatus = voteStatus + 2 * vote;

					const voteIdx = postStateValue.postVotes.findIndex(
						(vote) => vote.id === existingVote.id
					);
					updatedPostVotes[voteIdx] = {
						...existingVote,
						voteValue: vote,
					};
					// actualizar el docuemto postVote
					batch.update(postVoteRef, {
						voteValue: vote,
					});
					voteChange = 2 * vote;
				}
			}
			//actualizar documento de post
			const postRef = doc(firestore, "posts", post.id!);
			batch.update(postRef, { voteStatus: voteStatus + voteChange });

			await batch.commit();

			//actualizar estado con valores nuevos
			const postIdx = postStateValue.posts.findIndex(
				(item) => item.id === post.id
			);
			updatedPosts[postIdx] = updatedPost;
			setPostStateValue((prev) => ({
				...prev,
				posts: updatedPosts,
				postVotes: updatedPostVotes,
			}));

			if (postStateValue.selectedPost) {
				setPostStateValue((prev) => ({
					...prev,
					selectedPost: updatedPost,
				}));
			}
		} catch (error) {
			console.log("onVote error", error);
		}
	};
	const onSelectPost = (post: Post) => {
		setPostStateValue((prev) => ({
			...prev,
			selectedPost: post,
		}));
		router.push(`/r/${post.communityId}/comments/${post.id}`);
	};

	const onDeletePost = async (post: Post): Promise<boolean> => {
		try {
			//check if there is an image, delete it
			if (post.imageURL) {
				const imageRef = ref(storage, `posts/${post.id}/image`);
				await deleteObject(imageRef);
			}
			//delete post doc from firebase
			const postDocRef = doc(firestore, "posts", post.id!);
			await deleteDoc(postDocRef);
			//update recoil state
			setPostStateValue((prev) => ({
				...prev,
				posts: prev.posts.filter((item) => item.id !== post.id),
			}));

			return true;
		} catch (error) {
			return false;
		}
	};

	const getCommunityPostVotes = async (communityId: string) => {
		const postVotesQuery = query(
			collection(firestore, "users", `${user?.uid}/postVotes`),
			where("communityId", "==", communityId)
		);

		const postVoteDocs = await getDocs(postVotesQuery);
		const postVotes = postVoteDocs.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		setPostStateValue((prev) => ({
			...prev,
			postVotes: postVotes as PostVote[],
		}));
	};

	useEffect(() => {
		if (!user || !currentCommunity?.id) return;
		getCommunityPostVotes(currentCommunity?.id);
	}, [user, currentCommunity]);

	useEffect(() => {
		if (!user) {
			// vaciar votos de usuario si no hay nadie logeado
			setPostStateValue((prev) => ({
				...prev,
				postVotes: [],
			}));
		}
	}, [user]);

	return {
		postStateValue,
		setPostStateValue,
		onVote,
		onSelectPost,
		onDeletePost,
	};
};
export default usePosts;
