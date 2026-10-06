import { notFound } from "next/navigation";
import { HomeView } from "../../../components/home-view";
import { getDictionary, isLang } from "../../i18n";

export default async function I18nHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return <HomeView lang={lang} dict={getDictionary(lang)} />;
}
