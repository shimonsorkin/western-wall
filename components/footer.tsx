import { buttonVariants } from "./ui/button";
import { socialLinks } from "@/lib/constants";
import Link from "next/link";
import {
  SiFacebook,
  SiTelegram,
  SiInstagram,
  SiX,
  SiLinkedin,
  SiYoutube,
} from "react-icons/si";

export const Footer = () => {
  return (
    <div className="flex gap-4 items-center">
      <Link target="_blank" className={buttonVariants({ size: "icon-xl" })} href={socialLinks.facebook}>
        <SiFacebook className="size-5" />
      </Link>
      <Link target="_blank" className={buttonVariants({ size: "icon-xl" })} href={socialLinks.telegram}>
        <SiTelegram className="size-5" />
      </Link>
      <Link target="_blank" className={buttonVariants({ size: "icon-xl" })} href={socialLinks.instagram}>
        <SiInstagram className="size-5" />
      </Link>
      <Link target="_blank" className={buttonVariants({ size: "icon-xl" })} href={socialLinks.x}>
        <SiX className="size-5" />
      </Link>
      <Link target="_blank" className={buttonVariants({ size: "icon-xl" })} href={socialLinks.linkedin}>
        <SiLinkedin className="size-5" />
      </Link>
      <Link target="_blank" className={buttonVariants({ size: "icon-xl" })} href={socialLinks.youtube}>
        <SiYoutube className="size-5" />
      </Link>
    </div>
  );
};
