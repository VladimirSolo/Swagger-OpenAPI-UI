import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-16 py-32">
        <h1 className="max-w-md text-center text-3xl leading-10 font-semibold tracking-tight text-black dark:text-zinc-50">
          {t('title')}
        </h1>
      </main>
    </div>
  );
}
