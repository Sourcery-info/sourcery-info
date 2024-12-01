<script lang="ts">
    import type { Conversation } from '@sourcery/common/types/Conversation.type';
    
    export let data: {
        conversations: Conversation[];
        project_id: string;
    };
</script>

<div class="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-bold text-white mb-8">All Conversations</h1>
        
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {#each data.conversations as conversation}
                <a 
                    href="/chat/{conversation.project_id}/{conversation._id}"
                    class="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-semibold text-white truncate">
                            {conversation.description}
                        </h2>
                        <span class="text-gray-400">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                    <p class="mt-2 text-sm text-gray-400">
                        { conversation.created_at ? new Date(conversation.created_at).toLocaleDateString() : '' }
                    </p>
                </a>
            {/each}
        </div>
    </div>
</div> 