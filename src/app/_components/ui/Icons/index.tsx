import type { IconType } from "react-icons";
import { FaUser, FaX } from "react-icons/fa6";
import { FaMoon } from "react-icons/fa";

export const IconX: IconType = (props) => <FaX {...props} />;
export const IconMoon: IconType = (props) => <FaMoon {...props} />;
export const IconPerson: IconType = (props) => <FaUser {...props} />;
