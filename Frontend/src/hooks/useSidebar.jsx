import { useContext } from "react"
import { SidebarContext } from "@/components/ui/sidebar-consts"

export const useSidebar = () => {
  const context = useContext(SidebarContext)

  if (context === undefined || context === null)
    throw new Error("useSidebar must be used within a SidebarProvider")

  return context
}

export default useSidebar
