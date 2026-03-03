import type { AnchorHTMLAttributes, ReactNode } from 'react';

interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
	children: ReactNode;
	href: string;
}

export function AppLink({ children, href, ...props }: AppLinkProps) {
	return (
		<a href={href} {...props}>
			{children}
		</a>
	);
}
