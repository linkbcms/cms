'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function addToWaitlist(
  prevState: {
    message: string;
  },
  formData: FormData,
) {
  const schema = z.object({
    email: z.string().email(),
  });
  const parse = schema.safeParse({
    email: formData.get('email'),
  });

  if (!parse.success) {
    // Return early if the form data is invalid
    return {
      message: 'Invalid form data',
      errors: parse.error.flatten().fieldErrors,
      data: undefined,
      input: parse.data,
    };
  }

  const refId = (await cookies()).get('ref_id')?.value;
  const waitlistId = process.env.WAITLIST_ID;
  const data = {
    ...parse.data,
    waitlist_id: waitlistId ? Number(waitlistId) : undefined,
    referral_link: refId ? `https://linkbcms.com?ref_id=${refId}` : undefined,
  };

  console.log('data', data);

  try {
    const res = await fetch('https://api.getwaitlist.com/api/v1/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('res', res);

    if (!res.ok) {
      const response = await res.json();
      console.log('response error', response);
      throw new Error(response?.error_string || 'Failed to add to waitlist');
    }
    const response = await res.json();

    console.log('response success', response);

    revalidatePath('/');
    return {
      message: `${data.email} added to waitlist`,
      data: response,
      input: parse.data,
    };
  } catch (e) {
    console.error('error adding to waitlist', e);
    return { message: 'Failed to add to waitlist', error: e, data: undefined };
  }
}
