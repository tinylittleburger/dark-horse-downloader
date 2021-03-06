const idMarker = '/api/v/books/details/';
const idLength = 32;

function previousElement(node) {
	do {
		node = node.previousSibling;
	} while (node && node.nodeType !== Node.ELEMENT_NODE);

	return node;
}

if (document.getElementsByClassName('product-gallery').length > 0) {
	const elements = document.getElementsByClassName('profile-buy');

	Array.prototype.forEach.call(elements, element => {
		const title = previousElement(element).title;
		const readUrl = element.children[0].href;

		const background = document.createElement('div');
		background.className = 'background';

		const content = document.createElement('div');
		content.className = 'download';

		background.appendChild(content);
		element.appendChild(background);

		background.addEventListener('click', () => {
			content.className = 'spinner';
			content.innerHTML = null;

			fetch(readUrl, {
				credentials: 'include'
			}).then(response => {
				if (response.ok) {
					return response.text();
				} else {
					throw new Error('Failed to open the comic book page.');
				}
			}).then(text => {
				const idIndex = text.indexOf(idMarker);

				if (idIndex === -1) {
					throw new Error('Download link for the comic book could not be found.');
				}

				const idStart = idIndex + idMarker.length;
				const idEnd = idStart + idLength;
				const id = text.substring(idStart, idEnd);
				const downloadUrl = 'https://digital.darkhorse.com/api/v6/book/' + id;

				return downloadUrl;
			}).then(downloadUrl => {
				chrome.runtime.sendMessage({
					downloadUrl: downloadUrl,
					title: title
				});
			}).catch(error => {
				chrome.runtime.sendMessage({
					error: error.message
				});
			}).then(() => {
				content.className = 'download';
			});
		});
	});
}
