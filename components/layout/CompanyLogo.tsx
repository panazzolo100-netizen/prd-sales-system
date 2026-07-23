import Image from "next/image";
import logoPrd from "@/public/logo-prd.png";
import iconPrd from "@/public/icone-prd.png";

export function CompanyLogo({ collapsed }: { collapsed: boolean }) {
  return <Image
    src={collapsed ? iconPrd : logoPrd}
    alt="PRD Engenharia"
    width={collapsed ? 40 : 175}
    height={collapsed ? 40 : 73}
    priority
    unoptimized
    className={collapsed ? "h-10 w-10 object-contain" : "h-[64px] w-[175px] object-contain object-left"}
  />;
}
