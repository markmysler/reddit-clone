import { doc, getDoc } from "firebase/firestore";
import { GetServerSidePropsContext } from "next";
import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { Community, communityState } from "reddit-clone/atoms/communitiesAtom";
import About from "reddit-clone/components/Community/About";
import CreatePostLink from "reddit-clone/components/Community/CreatePostLink";
import Header from "reddit-clone/components/Community/Header";
import CommunityNotFound from "reddit-clone/components/Community/NotFound";
import PageContent from "reddit-clone/components/Layout/PageContent";
import Posts from "reddit-clone/components/Posts/Posts";
import { firestore } from "reddit-clone/firebase/clientApp";
import safeJsonStringify from "safe-json-stringify";

type CommunityPageProps = {
	communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
	console.log("here is data", communityData);
	const setCommunityStateValue = useSetRecoilState(communityState);

	useEffect(() => {
		setCommunityStateValue((prev) => ({
			...prev,
			currentCommunity: communityData,
		}));
	}, [communityData]);

	if (!communityData) {
		return <CommunityNotFound />;
	}

	return (
		<>
			<Header communityData={communityData} />
			<PageContent>
				<>
					<CreatePostLink />
					<Posts communityData={communityData} />
				</>
				<>
					<About communityData={communityData} />
				</>
			</PageContent>
		</>
	);
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	//get community data and pass it to user
	try {
		const communityDocRef = doc(
			firestore,
			"communities",
			context.query.communityId as string
		);
		const communityDoc = await getDoc(communityDocRef);

		return {
			props: {
				communityData: communityDoc.exists()
					? JSON.parse(
							safeJsonStringify({
								id: communityDoc.id,
								...communityDoc.data(),
							})
					  )
					: "",
			},
		};
	} catch (error) {
		//could add error page here
		console.log("getServerSideProps error", error);
		return;
	}
}

export default CommunityPage;
