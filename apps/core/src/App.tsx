import { m } from "./paraglide/messages";
import { getLocale, locales, setLocale } from "./paraglide/runtime.js";

import Layout from "@/layout.js";

import "@workspace/ui/globals.css";

export const App = () => {
	return (
		<Layout>
			<div className="content">
				<h1>Rsbuild with React</h1>
				<p>Start building amazing things with Rsbuild.</p>
				<p>{m.example_message({ username: "John" })}</p>
				<p>{m.example_message_2({ username: "John" })}</p>
				<p>{getLocale()}</p>
				{locales.map((locale) => (
					<button key={locale} onClick={() => setLocale(locale)}>
						{locale}
					</button>
				))}
			</div>
		</Layout>
	);
};
