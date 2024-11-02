<script>
// @ts-nocheck
	
	import {
		Collapse,
		NavbarToggler,
		NavbarBrand,
		Nav,
		Navbar,
		NavItem,
		NavLink,
		Dropdown,
		DropdownToggle,
		DropdownMenu,
		DropdownItem,
		Icon
	} from '@sveltestrap/sveltestrap';

	import logo from '$lib/assets/Sourcery Logo.png';

	export let project;
	export let version;
	export let session;
	export let user;

	let userMenuIsOpen = false;
	let adminMenuIsOpen = false;

	// Check event.locals.session is not null
	
</script>
<div class="navbar-container">
<Navbar color="none" expand="sm" container="fluid">
	<NavbarBrand style="height: 40px" href="/"><img class="logo" alt="Sourcery.info" src={logo} /></NavbarBrand>
	<Nav class="ml-auto">
	{#if project}
		<NavItem>
			<NavLink href="/chat/{project.urlid}">{project.name}</NavLink>
		</NavItem>
	{/if}
	</Nav>
	<Nav class="ms-auto"></Nav>
	{#if project}
		<Nav class="mr-auto">
			<NavItem>
				<NavLink href="/files/{project.urlid}">
					<Icon name="folder-fill" />
				</NavLink>
			</NavItem>
			<NavItem>
				<NavLink href="/edit/{project.urlid}">
					<Icon name="gear-fill" />
				</NavLink>
			</NavItem>
		</Nav>
	{/if}
	
	{#if session}
		<Dropdown isOpen={userMenuIsOpen} on:toggle={() => userMenuIsOpen = !userMenuIsOpen}>
			<DropdownToggle>
				<Icon name="person-fill" />
			</DropdownToggle>
			<DropdownMenu>
				<DropdownItem>
					<NavLink href="/profile">
						<Icon name="person-fill" /> Profile
					</NavLink>
				</DropdownItem>
				<DropdownItem>
					<NavLink href="/settings">
						<Icon name="gear-fill" /> Settings
					</NavLink>
				</DropdownItem>
				<DropdownItem>
					<NavLink href="/logout">
						<Icon name="door-open-fill" /> Logout
					</NavLink>
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	{/if}
	{#if user?.admin}
		<Dropdown isOpen={adminMenuIsOpen} on:toggle={() => adminMenuIsOpen = !adminMenuIsOpen}>
			<DropdownToggle>
				<Icon name="gear-fill" />
			</DropdownToggle>
			<DropdownMenu>
				<DropdownItem>
					<NavLink href="/admin/users/list">
						<Icon name="people-fill" /> Users
					</NavLink>
				</DropdownItem>
				<DropdownItem>
					<NavItem>v{version}</NavItem>
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	{/if}
</Navbar>
</div>

<style class="less">
	.logo {
		height: 100%;
	}
</style>
