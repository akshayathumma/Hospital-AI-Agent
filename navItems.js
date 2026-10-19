import { FaBoxes, FaCommentMedical, FaHome, FaInfoCircle, FaPills, FaQuestionCircle } from "react-icons/fa";

export const NAV_ITEMS = [
  { to: "/", label: "Home", icon: FaHome },
  { to: "/chat", label: "AI Chat", icon: FaCommentMedical },
  { to: "/search", label: "Medicine Search", icon: FaPills },
  { to: "/stock", label: "Stock Search", icon: FaBoxes },
  { to: "/faq", label: "FAQ", icon: FaQuestionCircle },
  { to: "/about", label: "About", icon: FaInfoCircle },
];