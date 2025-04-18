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

export const XIcon: IconType = (props) => <FaX {...props} />;
export const MoonIcon: IconType = (props) => <FaMoon {...props} />;
export const SunIcon: IconType = (props) => <FaSun {...props} />;
export const PersonIcon: IconType = (props) => <FaUser {...props} />;
export const QuestionIcon: IconType = (props) => <FaQuestion {...props} />;
export const UserGearIcon: IconType = (props) => <FaUserGear {...props} />;
export const GearIcon: IconType = (props) => <FaGear {...props} />;
export const BookOpenIcon: IconType = (props) => <FaBookOpen {...props} />;
