import useProfile from "@/hooks/useProfile";
import { cn } from "@/libs/utils";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BiMenu, BiSolidBell } from "react-icons/bi";
import Battery from "../Common/Battery";
import UserStreak from "../Common/UserStreak";
import NavbarMenu from "./NavbarMenu";
import Sidebar from "./Sidebar";
import useStreak from "@/hooks/useStreak";
import Notification from "../Notification/Index";
import useNotification from "@/hooks/useNotification";
import { useDispatch } from "react-redux";
import { readNotification } from "@/redux/feature/socketSlice";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const { profile } = useProfile();
  const { streak, longestStreak, totalWorkout, isLoading } = useStreak({
    userId: profile?._id,
  });
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openNotificationbar, setOpenNotificationbar] = useState(false);
  const { newNotification } = useNotification({ open: openNotificationbar });
  const dispatch = useDispatch();

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        // Clicked outside the element, do something
        setOpenSidebar(false);
      }
    };

    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNoficationBar = () => {
    setOpenNotificationbar(true);
    dispatch(readNotification({}));
  };
  return (
    <nav className="w-full flex bg-zinc-950/70 backdrop-blur-sm border-b-zinc-800 border-b">
      <div className="relative  w-full md:px-5  px-3 py-2 flex justify-between items-center  gap-5 z-20  ">
        <div className="flex  items-center">
          <Link
            href={"/"}
            className="sm:hidden flex items-center justify-center relative sm:h-[70px] h-[60px]   sm:w-[80px] w-[70px]  flex-col "
          >
            <Image
              src={"/assets/logo3.svg"}
              alt="logo"
              height={100}
              width={100}
              className="max-sm:absolute w-full h-full"
            />
          </Link>
          <div className="md:block hidden">
            <UserStreak
              streak={streak ?? 0}
              isLoading={isLoading}
              longestStreak={longestStreak}
              totalWorkout={totalWorkout}
            />
          </div>
        </div>

        <div className="flex justify-between items-center gap-2">
          <div
            onClick={handleNoficationBar}
            className="relative bg-zinc-800/75 rounded-lg flex items-center justify-center h-10 w-10  cursor-pointer"
          >
            <BiSolidBell
              size={21}
              className=" fill-neutral-400 hover:fill-neutral-200"
            />
            {newNotification && (
              <div className="h-2 w-2 bg-emerald-600 ring-4 ring-emerald-600/20 absolute rounded-full top-2 right-2" />
            )}
          </div>
          <div className="flex items-start gap-2  transition-all px-3 py-2 rounded-lg">
            <NavbarMenu profile={profile} />
          </div>

          <div className="flex gap-2 items-center  relative  max-[280px]:w-full">
            <BiMenu
              onClick={() => setOpenSidebar((prev) => !prev)}
              className=" fill-zinc-200  hover:bg-zinc-900 rounded-full transition duration-300 cursor-pointer block md:hidden"
              size={30}
            />

            <div
              ref={sidebarRef}
              className={cn(
                "fixed top-0 left-0 z-50  transition duration-200 delay-100 md:hidden flex bg-black w-full",
                {
                  "translate-x-0": openSidebar,
                }
              )}
            >
              <Sidebar setSideDrawer={setOpenSidebar} openMenu={openSidebar} />
            </div>
          </div>
          <Notification
            open={openNotificationbar}
            setClose={() => setOpenNotificationbar(false)}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
