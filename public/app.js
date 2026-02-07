const socket = io();

const usernameEl = document.getElementById('username');
const groupNameEl = document.getElementById('groupName');
const createGroupBtn = document.getElementById('createGroup');
const joinGroupIdEl = document.getElementById('joinGroupId');
const joinGroupBtn = document.getElementById('joinGroup');
const groupArea = document.getElementById('groupArea');
const groupTitle = document.getElementById('groupTitle');
const membersEl = document.getElementById('members');
const downLabelEl = document.getElementById('downLabel');
const downLocationEl = document.getElementById('downLocation');
const createDownBtn = document.getElementById('createDown');
const downsEl = document.getElementById('downs');

let currentGroupId = null;
let localSocketId = null;

socket.on('connect', () => { localSocketId = socket.id; });

createGroupBtn.addEventListener('click', () => {
  const username = usernameEl.value.trim();
  const groupName = groupNameEl.value.trim();
  if (!username || !groupName) return alert('Enter name and group name');
  socket.emit('create_group', { groupName, username }, (res) => {
    if (res.ok) { enterGroup(res.groupId, res.group, username); }
    else alert(res.error || 'Failed');
  });
});

joinGroupBtn.addEventListener('click', () => {
  const username = usernameEl.value.trim();
  const groupId = joinGroupIdEl.value.trim();
  if (!username || !groupId) return alert('Enter name and group id');
  socket.emit('join_group', { groupId, username }, (res) => {
    if (res.ok) enterGroup(res.groupId, res.group, username);
    else alert(res.error || 'Failed');
  });
});

function enterGroup(groupId, group, username) {
  currentGroupId = groupId;
  groupTitle.textContent = `${group.name} — ${groupId}`;
  groupArea.hidden = false;
  renderGroup(group);
}

createDownBtn.addEventListener('click', () => {
  const label = downLabelEl.value.trim() || 'Down';
  const location = downLocationEl.value.trim() || '';
  socket.emit('create_down', { groupId: currentGroupId, label, location }, (res) => {
    if (!res.ok) alert(res.error || 'Failed to create');
  });
});

socket.on('group_update', (group) => { if (group && currentGroupId) renderGroup(group); });
socket.on('down_created', (down) => { addOrUpdateDown(down); });
socket.on('down_updated', (down) => { addOrUpdateDown(down); });
socket.on('presence_update', ({ socketId, username, presence }) => { updateMemberPresence(socketId, username, presence); });
socket.on('poke_received', ({ from }) => { alert(`Poke from ${from}`); });

function renderGroup(group) {
  membersEl.innerHTML = '';
  for (const [sockId, m] of Object.entries(group.members)) {
    const div = document.createElement('div');
    div.className = 'member';
    const name = document.createElement('div');
    name.textContent = m.username + (sockId === localSocketId ? ' (you)' : '');
    const presence = document.createElement('div');
    presence.className = 'presence';
    presence.id = `presence_${sockId}`;
    presence.textContent = m.presence ? `${m.presence.location} • ${new Date(m.presence.when).toLocaleTimeString()}` : '';
    const pokeBtn = document.createElement('button');
    pokeBtn.textContent = 'Poke';
    pokeBtn.onclick = () => { socket.emit('poke', { groupId: currentGroupId, targetSocketId: sockId }, (res) => { if (!res.ok) alert(res.error); }); };
    const checkinBtn = document.createElement('button');
    checkinBtn.textContent = 'At library';
    checkinBtn.onclick = () => { socket.emit('presence_checkin', { groupId: currentGroupId, location: 'At library' }, (res) => { if (!res.ok) alert(res.error); }); };
    div.appendChild(name);
    div.appendChild(presence);
    if (sockId !== localSocketId) div.appendChild(pokeBtn);
    div.appendChild(checkinBtn);
    membersEl.appendChild(div);
  }

  // render downs
  downsEl.innerHTML = '';
  for (const d of Object.values(group.downs)) addOrUpdateDown(d);
}

function addOrUpdateDown(down) {
  let el = document.getElementById(`down_${down.id}`);
  if (!el) {
    el = document.createElement('div');
    el.className = 'down';
    el.id = `down_${down.id}`;
    downsEl.appendChild(el);
  }
  el.innerHTML = '';
  const title = document.createElement('div');
  title.textContent = `${down.label} — ${down.location || ''}`;
  const creator = document.createElement('div');
  creator.textContent = `Creator: ${down.creator}`;
  const participants = document.createElement('div');
  participants.textContent = `Joined: ${down.participants.join(', ')}`;
  const btn = document.createElement('button');
  btn.textContent = 'Down';
  btn.onclick = () => { socket.emit('tap_down', { groupId: currentGroupId, downId: down.id }, (res) => { if (!res.ok) alert(res.error); }); };
  el.appendChild(title);
  el.appendChild(creator);
  el.appendChild(participants);
  el.appendChild(btn);
}

function updateMemberPresence(sockId, username, presence) {
  const el = document.getElementById(`presence_${sockId}`);
  if (el) el.textContent = `${presence.location} • ${new Date(presence.when).toLocaleTimeString()}`;
}
