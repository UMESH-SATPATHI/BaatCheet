import {useState, useRef} from "react";
import {useAuthStore} from "../store/authStore";
import {useChatStore} from "../store/chatStore";
import {logOutIcon, Volume2Icon, VolumeOffIcon} from "lucide-react";

function ProfileHeader() {
    const {authUser, logout} = useAuthStore();
    
}