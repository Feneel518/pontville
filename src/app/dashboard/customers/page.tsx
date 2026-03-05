import CustomersList from "@/components/dashboard/customers/CustomerList";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";

export default async function CustomersPage() {
  // Replace this with your real restaurant resolver
  const restaurantId = await getRestaurantId();

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Search + infinite scrolling
        </p>
      </div>

      <CustomersList restaurantId={restaurantId} />
    </div>
  );
}
