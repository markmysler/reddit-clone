import { Box, Text } from "@chakra-ui/react";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { communityState } from "reddit-clone/atoms/communitiesAtom";
import PageContent from "reddit-clone/components/Layout/PageContent";
import NewPostForm from "reddit-clone/components/Posts/NewPostForm";
import { auth } from "reddit-clone/firebase/clientApp";
import { useRecoilValue } from "recoil";
import useCommunityData from "reddit-clone/hooks/useCommunityData";
import About from "reddit-clone/components/Community/About";

const SubmitPostPage: React.FC = () => {
	const [user] = useAuthState(auth);
	// const communityStateValue = useRecoilValue(communityState);
	const { communityStateValue } = useCommunityData();
	console.log("COMMUNITY", communityStateValue);

	return (
		<PageContent>
			<>
				<Box p="14px 0px" borderBottom="1px solid" borderColor="white">
					<Text>Create a post</Text>
				</Box>
				{user && (
					<NewPostForm
						user={user}
						communityImageURL={
							communityStateValue.currentCommunity?.imageURL
						}
					/>
				)}
			</>
			<>
				{communityStateValue.currentCommunity && (
					<About
						communityData={communityStateValue.currentCommunity}
					/>
				)}
			</>
		</PageContent>
	);
};
export default SubmitPostPage;
