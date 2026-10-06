import { HomeView } from "../../components/home-view";
import { getDictionary, DEFAULT_LANG } from "../i18n";

export default function Home() {
  return <HomeView lang={DEFAULT_LANG} dict={getDictionary(DEFAULT_LANG)} />;
}
