import { Store, ShoppingCart, LogOut, ListOrdered } from "lucide-react"
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
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