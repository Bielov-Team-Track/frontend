"use client";

import React, { PropsWithChildren, useEffect, useState } from "react";

type DelayWrapperProps = {
	timeInSeconds: number;
	text: string;
} & PropsWithChildren;

function DelayWrapper({ children, timeInSeconds, text }: DelayWrapperProps) {
	const [showChildren, setShowChildren] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setShowChildren(true), timeInSeconds * 1000);
		return () => clearTimeout(t);
	}, [timeInSeconds]);

	if (!showChildren) {
		return <div>{text}</div>;
	}

	return <>{children}</>;
}

export default DelayWrapper;
