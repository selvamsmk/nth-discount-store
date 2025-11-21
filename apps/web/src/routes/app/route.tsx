import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/app')({
  component: RouteComponent,
  beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		return { session };
	},
})

function RouteComponent() {
  return (
     <SidebarProvider>
      <AppSidebar />
      <main className='w-full'>
        <SidebarTrigger />
        <div className='ml-8 h-full'>
            <Outlet/>
        </div>
      </main>
    </SidebarProvider>)
}
