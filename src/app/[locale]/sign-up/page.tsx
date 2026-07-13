'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button, Flex, Form, Input, Typography, message } from 'antd';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/contexts/auth-context';
import { Link, useRouter } from '@/i18n/navigation';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { establishSession } from '@/lib/auth/establish-session';
import { getFirebaseAuthErrorKey } from '@/lib/auth/firebase-error-messages';
import { signUpSchema, type SignUpFormValues } from '@/lib/auth/schemas';

export default function SignUpPage() {
  const t = useTranslations('SignUp');
  const tErrors = useTranslations('Errors');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!authLoading && user && !isSubmitting) {
      router.replace('/');
    }
  }, [authLoading, user, isSubmitting, router]);

  async function onSubmit(values: SignUpFormValues) {
    try {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        values.email,
        values.password,
      );
      const idToken = await credential.user.getIdToken();
      await establishSession(idToken);
      router.push('/');
      router.refresh();
    } catch (error) {
      const code = error instanceof FirebaseError ? error.code : '';
      messageApi.error(tErrors(getFirebaseAuthErrorKey(code)));
    }
  }

  return (
    <Flex vertical justify="center" flex={1} className="mx-auto! w-full max-w-md px-6 py-16">
      {contextHolder}
      <Typography.Title level={1} className="text-2xl!">
        {t('title')}
      </Typography.Title>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Form.Item
          label={t('email')}
          htmlFor="sign-up-email"
          validateStatus={errors.email ? 'error' : ''}
          help={errors.email ? tErrors(errors.email.message ?? 'generic') : undefined}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input id="sign-up-email" type="email" autoComplete="email" {...field} />
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('password')}
          htmlFor="sign-up-password"
          validateStatus={errors.password ? 'error' : ''}
          help={errors.password ? tErrors(errors.password.message ?? 'generic') : undefined}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password id="sign-up-password" autoComplete="new-password" {...field} />
            )}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={isSubmitting} block>
          {t('submit')}
        </Button>
      </form>
      <Typography.Text className="mt-4! text-center!">
        {t('haveAccount')} <Link href="/sign-in">{t('signInLink')}</Link>
      </Typography.Text>
    </Flex>
  );
}
