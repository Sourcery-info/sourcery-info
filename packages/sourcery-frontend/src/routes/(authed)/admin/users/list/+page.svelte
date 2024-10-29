<script lang="ts">
    /** @type {import('./$types').PageData} */
    import { Table, Button } from '@sveltestrap/sveltestrap';

    export let data;
</script>

<h1>Users</h1>

<p>Total users: {data.userCount}</p>

<Table striped>
    <thead>
        <tr>
            <th>Username</th>
            <th>Approved</th>
            <th>Admin</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {#each data.users as user}
            <tr>
                <td>{user.username}</td>
                <td>{user.approved ? 'Approved' : 'Pending'}</td>
                <td>{user.admin ? 'Admin' : 'User'}</td>
                <td>
                    <Button color="primary" href={`/admin/users/edit/${user.user_id}`}>Edit</Button>
                </td>
            </tr>
        {/each}
    </tbody>
</Table>