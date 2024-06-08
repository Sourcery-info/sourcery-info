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

	let isOpen = false;

    function handleUpdate(event) {
		isOpen = event?.detail?.isOpen;
	}
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
	<Nav class="mr-auto">
		<NavItem>v{version}</NavItem>
	</Nav>
</Navbar>
</div>

<style class="less">
	.logo {
		height: 100%;
	}
</style>