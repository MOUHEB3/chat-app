import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
  Switch,
} from "@headlessui/react";
import { Fragment, useRef, useState, useEffect } from "react";
import { BiSearch, RiUserSearchLine, RxCross2, profile2 } from "../assets";
import {
  createOneToOneChat,
  getAllcurrentUserChats,
  getAvailableUsers,
  createGroupChat,
} from "../api";
import { useChat } from "../context/ChatContext";
import { requestHandler, LocalStorage } from "../utils";

export function AddChat({ open }) {
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupChatParticipants, setGroupChatParticipants] = useState([]);
  const [users, setUsers] = useState([]);
  const [creatingChat, setCreatingChat] = useState(false);

  // context
  const {
    openAddChat,
    setOpenAddChat,
    newChatUser,
    setNewChatUser,
    loadingChats,
    setLoadingChats,
    currentUserChats,
    setCurrentUserChats,
    getCurrentUserChats,
    setActiveLeftSidebar,
  } = useChat();

  // ref's
  const searchUserRef = useRef();

  // NEW: Read the "groupChat" flag from LocalStorage when the modal opens.
  useEffect(() => {
    const groupFlag = LocalStorage.get("groupChat");
    if (groupFlag) {
      setIsGroupChat(true);
    } else {
      setIsGroupChat(false);
    }
  }, [openAddChat]);

  const handleClose = () => {
    setUsers([]);
    setNewChatUser(null);
    setGroupName("");
    setGroupChatParticipants([]);
    setOpenAddChat(false);
  };

  // search users for adding into group
  const handleSearchUser = async () => {
    const { data } = await getAvailableUsers(searchUserRef.current.value);
    setUsers(data.data?.users || []);
  };

  // create a new chat with a new user
  const createNewOneToOneChat = async () => {
    if (!newChatUser) return alert("please select an user");

    // handle the request to create a new chat
    await requestHandler(
      () => createOneToOneChat(newChatUser?._id),
      setCreatingChat,
      (res) => {
        const { data } = res;
        if (data?.existing) {
          return alert("chat already exists with the selected user");
        }
        getCurrentUserChats();
        setActiveLeftSidebar("recentChats");
        handleClose();
      },
      alert
    );
  };

  // create group chat
  const createNewGroupChat = async () => {
    // check if group name exists or not
    if (!groupName.trim()) {
      return alert("no group name provided");
    }
    // check for group chat participants
    if (!groupChatParticipants.length || groupChatParticipants.length < 2) {
      return alert("There must be atleast 2 members in the group");
    }
    await requestHandler(
      async () => createGroupChat(groupName, groupChatParticipants),
      setCreatingChat,
      (res) => {
        const { data } = res;
        getCurrentUserChats();
        setActiveLeftSidebar("recentChats");
        handleClose();
      }
    );
  };

  return (
    <Transition show={openAddChat} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className=" w-full relative transform overflow-hidden rounded-lg bg-white dark:bg-backgroundDark1 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                    <DialogTitle
                      as="h3"
                      className="text-lg leading-6 font-medium text-slate-500 dark:text-slate-50 "
                    >
                      Create chat
                    </DialogTitle>
                    {/* If not a group chat, show one-to-one chat confirmation */}
                    {!isGroupChat && (
                      <div className="mt-3">
                        <p className="text-lg font-medium dark:text-slate-50 text-slate-900">
                          Sure you want to create a chat with{" "}
                          {newChatUser?.username} ?
                        </p>
                      </div>
                    )}

                    {/* If group chat, show group creation UI */}
                    {isGroupChat && (
                      <div className="w-full">
                        <div className="inputs mt-5">
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-md outline-none bg-backgroundDark3 text-slate-100"
                            placeholder="Enter a group name"
                            onChange={(e) => setGroupName(e.target.value)}
                          />

                          <div className="addParticpants mt-2">
                            <div className="w-full flex justify-between items-center rounded-md outline-none bg-backgroundDark3">
                              <input
                                type="text"
                                className="w-[90%] px-3 py-2 rounded-md outline-none bg-transparent text-slate-100"
                                placeholder="Add more users..."
                                ref={searchUserRef}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSearchUser();
                                  }
                                }}
                              />
                              <span className=" text-slate-400 px-3 cursor-pointer">
                                <BiSearch
                                  className="size-5"
                                  onClick={() => handleSearchUser()}
                                />
                              </span>
                            </div>
                            <div className="inputAccordianDiv">
                              <ul className="dark:bg-backgroundDark3 rounded-md px-2 mt-1 max-h-[150px] overflow-auto ">
                                {users.map((user) => (
                                  <li
                                    key={user._id}
                                    className="dark:text-slate-100 flex justify-between items-center m-2"
                                  >
                                    <div className="flex items-center gap-2">
                                      <img
                                        className="w-10 h-10 rounded-full object-cover"
                                        src={user.avatarUrl}
                                        alt={user.username}
                                      />
                                      <span>{user.username}</span>
                                    </div>
                                    {!groupChatParticipants.some(
                                      ({ _id }) => user._id === _id
                                    ) ? (
                                      <button
                                        className="px-2 py-1 text-xs dark:text-white text-black bg-primary rounded-md hover:bg-primary_hover"
                                        onClick={() => {
                                          if (
                                            isGroupChat &&
                                            !groupChatParticipants?.some(
                                              (participant) =>
                                                participant._id === user._id
                                            )
                                          ) {
                                            setGroupChatParticipants([
                                              ...groupChatParticipants,
                                              user,
                                            ]);
                                          }
                                        }}
                                      >
                                        Add
                                      </button>
                                    ) : (
                                      ""
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="addedParticipants flex flex-wrap justify-center gap-1  mt-2">
                              {!!groupChatParticipants.length &&
                                groupChatParticipants.map((user) => (
                                  <div
                                    key={user._id}
                                    className="flex gap-[2px]  dark:bg-backgroundDark2 p-2 rounded-full items-center"
                                  >
                                    <div className="flex items-center gap-1">
                                      <img
                                        className="size-5 rounded-full object-cover"
                                        src={profile2}
                                        alt={user.username}
                                      />
                                      <span className="text-xs dark:text-slate-300">
                                        {user.username}
                                      </span>
                                    </div>
                                    <button
                                      className="ml-1 text-white"
                                      onClick={() => {
                                        setGroupChatParticipants(
                                          groupChatParticipants.filter(
                                            ({ _id }) => user._id !== _id
                                          )
                                        );
                                      }}
                                    >
                                      <RxCross2 />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-end">
                  <button
                    type="button"
                    className="rounded-md border border-transparent bg-backgroundDark2 px-4 py-2 text-base font-medium mx-2 text-white shadow-sm hover:bg-backgroundDark3"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium mx-2 text-white shadow-sm hover:bg-blue-700 "
                    onClick={isGroupChat ? createNewGroupChat : createNewOneToOneChat}
                  >
                    Create
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
