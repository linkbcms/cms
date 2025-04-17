import { useConfig } from '@/components/config-provider';
import { use$ } from '@legendapp/state/react';
import { useNavigate, useParams } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/pages/collection-table/data-table';
import { columns, type Payment } from '@/pages/collection-table/columns';
import type { CollectionConfig } from '@/index';
import { Loader2 } from 'lucide-react';
import type { JSX } from 'react/jsx-runtime';

export const CollectionsScreen = (): JSX.Element => {
  const { collection: collectionId } = useParams();
  const navigate = useNavigate();

  const config = useConfig();

  const collection = use$(
    () => collectionId && config.collections?.[collectionId]?.get(),
  );

  const query = useQuery({
    queryKey: ['collections', collectionId],
    queryFn: () => {
      return fetch(`/api/linkb/${collectionId}`).then((res) => res.json());
    },
  });

  const isLoading = query.isLoading;

  return (
    <div className="container mx-auto px-5 py-10">
      <h1 className="mb-5 font-semibold text-2xl">
        {(collection as CollectionConfig)?.label}
      </h1>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <DataTable<Payment, string>
          columns={columns}
          data={query?.data?.result || []}
          onRowClick={(row) => {
            navigate(`/collections/${collectionId}/${row.id}`);
          }}
        />
      )}
    </div>
  );
};
