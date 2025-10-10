self.addEventListener("push", function (event) {
	const payload = event.data?.json();
	event.waitUntil(
		self.registration.showNotification(payload.title, {
			body: payload.description,
		}),
	);
});
