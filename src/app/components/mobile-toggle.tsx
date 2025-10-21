import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { ServerSidebar } from "./server-sidebar"
import Sidebar from "../me/nav-sidebar"

export const MobileToggle=({serverId}:{serverId:string})=>{
    return(
        <Sheet>
            <SheetTitle>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu/>
                </Button>
            </SheetTrigger>
            </SheetTitle>
            <SheetContent side="left" className="p-0 flex gap-0">
                <div className="w-[72px]">
                    <Sidebar/>
                </div>
                <ServerSidebar serverId={serverId}/>
            </SheetContent>
        </Sheet>
    )
}