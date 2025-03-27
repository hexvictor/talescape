import type { IconType } from "react-icons";
import {
	FaBookOpen,
	FaGear,
	FaQuestion,
	FaSun,
	FaUser,
	FaUserGear,
	FaX,
} from "react-icons/fa6";
import { FaMoon } from "react-icons/fa";

export const IconX: IconType = (props) => <FaX {...props} />;
export const IconMoon: IconType = (props) => <FaMoon {...props} />;
export const IconSun: IconType = (props) => <FaSun {...props} />;
export const IconPerson: IconType = (props) => <FaUser {...props} />;
export const IconQuestion: IconType = (props) => <FaQuestion {...props} />;
export const IconUserGear: IconType = (props) => <FaUserGear {...props} />;
export const IconGear: IconType = (props) => <FaGear {...props} />;
export const IconBookOpen: IconType = (props) => <FaBookOpen {...props} />;
