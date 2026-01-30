// Buttons
const searchBtn = document.getElementById("searchBtn");
const battleBtn = document.getElementById("battleBtn");

// Forms
const searchForm = document.getElementById("searchForm");
const battleForm = document.getElementById("battleForm");

// Inputs
const searchInput = document.getElementById("searchInput");
const user1 = document.getElementById("user1");
const user2 = document.getElementById("user2");

// UI
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const result = document.getElementById("result");


// ================= TOGGLE =================

searchBtn.onclick = () => {
  searchForm.classList.remove("hidden");
  battleForm.classList.add("hidden");

  searchBtn.classList.add("active");
  battleBtn.classList.remove("active");

  result.innerHTML = "";
};

battleBtn.onclick = () => {
  battleForm.classList.remove("hidden");
  searchForm.classList.add("hidden");

  battleBtn.classList.add("active");
  searchBtn.classList.remove("active");

  result.innerHTML = "";
};


// ================= HELPERS =================

function showLoading(){
  loading.classList.remove("hidden");
  error.classList.add("hidden");
}

function hideLoading(){
  loading.classList.add("hidden");
}

function formatDate(date){
  return new Date(date).toLocaleDateString("en-GB",{
    day:"2-digit",
    month:"short",
    year:"numeric"
  });
}


// ================= FETCH USER =================

async function getUser(username){

  const userRes = await fetch(`https://api.github.com/users/${username}`);

  if(!userRes.ok){
    throw new Error("User Not Found");
  }

  const user = await userRes.json();

  const repoRes = await fetch(user.repos_url);
  const repos = await repoRes.json();

  return { user, repos };
}


// ================= COUNT STARS =================

function countStars(repos){

  let total = 0;

  for(let repo of repos){
    total += repo.stargazers_count;
  }

  return total;
}


// ================= SEARCH MODE (L1 + L2) =================

searchForm.addEventListener("submit", async (e)=>{

  e.preventDefault();

  const username = searchInput.value.trim();
  if(!username) return;

  showLoading();

  try{

    const data = await getUser(username);

    displaySingle(data.user, data.repos);

  }catch{

    error.classList.remove("hidden");

  }

  hideLoading();
});


function displaySingle(user, repos){

  result.innerHTML = `
    <div class="card">

      <img src="${user.avatar_url}">

      <h2>${user.name || "No Name"}</h2>

      <p>${user.bio || "No Bio"}</p>

      <p>Joined: ${formatDate(user.created_at)}</p>

      <p>Followers: ${user.followers}</p>

      <a href="${user.html_url}" target="_blank">
        Visit Profile
      </a>

      <h3>Top Repositories</h3>

      ${repos.slice(0,5).map(repo=>`
        <p>
          <a href="${repo.html_url}" target="_blank">
            ${repo.name}
          </a>
          ⭐ ${repo.stargazers_count}
        </p>
      `).join("")}

    </div>
  `;
}


// ================= BATTLE MODE (L3) =================

battleForm.addEventListener("submit", async (e)=>{

  e.preventDefault();

  const p1 = user1.value.trim();
  const p2 = user2.value.trim();

  if(!p1 || !p2) return;

  showLoading();

  try{

    // Fetch both at same time
    const [data1, data2] = await Promise.all([
      getUser(p1),
      getUser(p2)
    ]);

    battle(data1, data2);

  }catch{

    error.classList.remove("hidden");

  }

  hideLoading();
});


function battle(d1, d2){

  const stars1 = countStars(d1.repos);
  const stars2 = countStars(d2.repos);

  let class1 = "";
  let class2 = "";

  if(stars1 > stars2){
    class1 = "winner";
    class2 = "loser";
  }
  else if(stars2 > stars1){
    class2 = "winner";
    class1 = "loser";
  }

  result.innerHTML = `

    <div class="card ${class1}">
      <img src="${d1.user.avatar_url}">
      <h3>${d1.user.login}</h3>
      <p>⭐ ${stars1}</p>
      <p>Followers: ${d1.user.followers}</p>
    </div>

    <div class="card ${class2}">
      <img src="${d2.user.avatar_url}">
      <h3>${d2.user.login}</h3>
      <p>⭐ ${stars2}</p>
      <p>Followers: ${d2.user.followers}</p>
    </div>

  `;
}
