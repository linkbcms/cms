import { useConfig } from '@/components/config-provider';
import { toast } from '@/components/toaster';
import { use$ } from '@legendapp/state/react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from '@linkbcms/ui/components/alert-dialog';
import { Button } from '@linkbcms/ui/components/button';
import { useMutation } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import pluralize from 'pluralize';
import { useNavigate, useParams } from 'react-router';

export const DeleteCollection = () => {
  const { collection: collectionId, item: itemId } = useParams();
  const navigate = useNavigate();

  const config = useConfig();

  const collectionLabel = use$(
    () => collectionId && config.collections[collectionId]?.label.get(),
  );

  const mutationDelete = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/linkb/${collectionId}/${itemId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      navigate(`/collections/${collectionId}`);
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this{' '}
            {pluralize.singular(collectionLabel || '')} with ID {itemId}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete from the
            database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              try {
                toast.promise(() => mutationDelete.mutateAsync(), {
                  loading: 'Deleting...',
                  success: 'Deleted',
                  error: 'Failed to delete',
                });
              } catch (error) {
                console.error(error);
              }
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
