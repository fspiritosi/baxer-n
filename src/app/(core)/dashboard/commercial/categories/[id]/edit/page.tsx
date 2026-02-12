import { EditCategory } from '@/modules/commercial/features/products/features/categories';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  return <EditCategory categoryId={id} />;
}
