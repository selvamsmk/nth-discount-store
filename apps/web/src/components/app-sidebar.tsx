import { Store, ShoppingCart, LogOut, ListOrdered, Settings } from "lucide-react"
import { ShieldCheck } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useNavigate } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/utils/trpc"
import { Skeleton } from "./ui/skeleton"

// Menu items.
const items = [
  {
    title: "Store",
    url: "/app/store",
    icon: Store,
  },
  {
    title: "Cart",
    url: "/app/cart",
    icon: ShoppingCart,
  },
  {
    title: "Orders",
    url: "/app/orders",
    icon: ListOrdered,
  }
]

export function AppSidebar() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();
    const itemsCount = useQuery(trpc.cart.fetchItemsCount.queryOptions())
    const onSignOut = () => {
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate({
                        to: "/",
                    });
                },
            },
        });
    }
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                      {item.url === '/app/cart' && (itemsCount.data?.count ?? 0) > 0 ? (
                        <span
                          aria-label={`items in cart: ${itemsCount.data?.count ?? 0}`}
                          className="ml-2 inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-black"
                        >
                          {itemsCount.data?.count}
                        </span>
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {session?.user?.admin ? (
                <SidebarMenuItem key={'admin'}>
                  <SidebarMenuButton asChild>
                    <Link to={'/app/admin'} className='flex items-center gap-2'>
                      <ShieldCheck />
                      <span>Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            {
                isPending && (
                <Skeleton/>
                )
            }
            {
                session?.user?.admin && (
                <SidebarMenuItem key={"settings"}>
                    <SidebarMenuButton asChild>
                    <Link to={"/app/settings"} className="flex items-center gap-2">
                      <Settings />
                      <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                )
            }
              
            <SidebarMenuItem key={"sign-out"}>
                <SidebarMenuButton onClick={onSignOut}>
                    <LogOut/>
                    <span>Sign Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}