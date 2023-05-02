import { Flex, Image } from "@chakra-ui/react";
import React from "react";
import SearchInput from "./SearchInput";
import RightContent from "./RightContent/RightContent";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "reddit-clone/firebase/clientApp";
import Directory from "./Directory/Directory";
import useDirectory from "reddit-clone/hooks/useDirectory";
import { defaultMenuItem } from "reddit-clone/atoms/directoryMenuAtom";

const NavBar: React.FC = () => {
	const [user, loading, error] = useAuthState(auth);
	const { onSelectMenuItem } = useDirectory();
	return (
		<Flex
			bg="white"
			height="44px"
			padding="6px 12px"
			justify={{ md: "space-between" }}
		>
			<Flex
				align="center"
				width={{ base: "40px", md: "auto" }}
				mr={{ base: 0, md: 2 }}
				cursor="pointer"
				onClick={() => onSelectMenuItem(defaultMenuItem)}
			>
				<Image src="/Images/redditFace.svg" height="30px" />
				<Image
					src="/Images/redditText.svg"
					height="46px"
					display={{
						base: "none",
						md: "unset",
					}}
				/>
			</Flex>
			{user && <Directory />}
			<SearchInput user={user} />
			<RightContent user={user} />
		</Flex>
	);
};
export default NavBar;
