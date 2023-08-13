export interface NavLink {
    route: string;
    label: string;
}

export interface NavSubLink {
    label: string;
    routes: NavLink[];
}
