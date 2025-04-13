import { useConfig } from '@/components/config-provider';
import { use$ } from '@legendapp/state/react';
import { useNavigate, useParams } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/pages/collection-table/data-table';
import { columns, type Payment } from '@/pages/collection-table/columns';
import type { CollectionConfig } from '@/index';

export const CollectionsScreen = () => {
  const { collection: collectionId } = useParams();
  const navigate = useNavigate();

  const config = useConfig();

  const collection = use$(
    () => collectionId && config.collections?.[collectionId].get(),
  );

  const query = useQuery({
    queryKey: ['collections', collectionId],
    queryFn: () => {
      return fetch(`/api/${collectionId}`).then((res) => res.json());
    },
  });

  return (
    <div className="container mx-auto px-5 py-10">
      <h1 className="mb-5 font-semibold text-2xl">
        {(collection as CollectionConfig)?.label}
      </h1>
      <DataTable<Payment, string>
        columns={columns}
        data={query?.data?.result || []}
        onRowClick={(row) => {
          console.log(row);
          navigate(`/collections/${collectionId}/${row.id}`);
        }}
      />
    </div>
  );
};
