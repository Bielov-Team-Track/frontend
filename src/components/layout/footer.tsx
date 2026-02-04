const Footer = () => {
	return (
		<footer className="bg-surface-elevated text-white py-4">
			<div className="container mx-auto text-center">
				<p className="text-sm">&copy; {new Date().getFullYear()} Bielov Spike. All rights reserved.</p>
			</div>
		</footer>
	);
};

export default Footer;
