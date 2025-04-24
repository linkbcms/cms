'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// CREATE TABLE todos (
//   id SERIAL PRIMARY KEY,
//   text TEXT NOT NULL
// );

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

  const data = {
    ...parse.data,
    waitlist_id: process.env.WAITLIST_ID,
  };

  try {
    const res = await fetch('https://api.getwaitlist.com/api/v1/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(res);

    if (!res.ok) {
      const response = await res.json();
      throw new Error(response?.message || 'Failed to add to waitlist');
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
    return { message: 'Failed to add to waitlist', error: e };
  }
}
