import cheerio from "cheerio";
import fetch from "node-fetch";

const aimer = async (url) => {
	const html = await fetch(url).then((res) => res.text());
	return cheerio.load(html);
};

function getOwner($, item) {
	try {
		return $(item).find(".owner").text();
	} catch (error) {
		return undefined;
	}
}

function getRepo($, item) {
	try {
		return $(item).find(".repo").text();
	} catch (error) {
		return undefined;
	}
}

function getDescription($, item) {
	try {
		return $(item).find(".pinned-item-desc").text().trim();
	} catch (error) {
		return undefined;
	}
}

function getWebsite(repo) {
	return aimer(repo)
		.then(($) => {
			try {
				const site = $(".BorderGrid-cell");
				if (!site || site.length === 0) return [];

				let href;
				site.each((index, item) => {
					if (index == 0) {
						href = getHREF($, item);
					}
				});
				return href;
			} catch (error) {
				console.error(error);
				return undefined;
			}
		})
		.catch((error) => {
			console.error(error);
			return undefined;
		});
}

function getHREF($, item) {
	try {
		return $(item).find('a[href^="https"]').attr("href")?.trim();
	} catch (error) {
		return undefined;
	}
}

function getLanguage($, item) {
	try {
		return $(item).find('[itemprop="programmingLanguage"]').text();
	} catch (error) {
		return undefined;
	}
}

function getLanguageColor($, item) {
	try {
		return $(item).find(".repo-language-color").css("background-color");
	} catch (error) {
		return undefined;
	}
}

function getStars($, item) {
	try {
		return $(item).find('a[href$="/stargazers"]').text().trim();
	} catch (error) {
		return 0;
	}
}

function getForks($, item) {
	try {
		return $(item).find('a[href$="/network/members"]').text().trim();
	} catch (error) {
		return 0;
	}
}

async function ghPinnedRepos(username) {
	const $ = await aimer(`https://github.com/${username}`);
	const pinned = $(".pinned-item-list-item.public").toArray();

	// if empty
	if (!pinned || pinned.length === 0) return [];

	const result = [];
	for (const [index, item] of pinned.entries()) {
		const owner = getOwner($, item);
		const repo = getRepo($, item);
		const link = "https://github.com/" + (owner || username) + "/" + repo;
		const description = getDescription($, item);
		const image = `https://opengraph.githubassets.com/1/${owner || username}/${repo}`;
		const website = await getWebsite(link);
		const language = getLanguage($, item);
		const languageColor = getLanguageColor($, item);
		const stars = getStars($, item);
		const forks = getForks($, item);

		result[index] = {
			owner: owner || username,
			repo,
			link,
			description: description || undefined,
			image: image,
			website: website || undefined,
			language: language || undefined,
			languageColor: languageColor || undefined,
			stars: stars || 0,
			forks: forks || 0,
		};
	}
	// });

	console.log(result);
	return result;
}

ghPinnedRepos("galaxy-digital");
