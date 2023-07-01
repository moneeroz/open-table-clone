import RestaurantNavBar from "../components/RestaurantNavBar";
import RestaurantMenu from "../components/RestaurantMenu";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fetchItems = async (slug: string) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      slug,
    },
    select: {
      items: true,
    },
  });

  //fix
  // return restaurant?.items;
  return restaurant!.items;
};

const Menu = async ({ params }: { params: { slug: string } }) => {
  const items = await fetchItems(params?.slug);

  return (
    <div className="bg-white w-[100%] rounded p-3 shadow">
      <RestaurantNavBar slug={params?.slug} />
      <RestaurantMenu menu={items} />
    </div>
  );
};

export default Menu;
