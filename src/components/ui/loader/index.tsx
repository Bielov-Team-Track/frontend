function Loader({ ...props }: any) {
	return (
		<div {...props} className={`grid place-items-center z-50 ${props.className}`}>
			<div className="nline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
		</div>
	);
}

export default Loader;
