export interface ProfileOptions {
    profileOptionName: string,
    profileOptionId: number
}

export interface AssignableProfiles {
    profileName: string,
    profileDescription: string,
    avaliableProfiles: ProfileOptions[],
    assignedProfiles: ProfileOptions[]
}

export interface ManageProfile {
    profileName: string,
    profileDescription: string,
    selectedProfileOptions: ProfileOptions[],
}