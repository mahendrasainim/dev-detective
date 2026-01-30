const form = document.getElementById("searchForm");
const input = document.getElementById("usernameInput");
const profileDiv = document.getElementById("profile");
const loadingText = document.getElementById("loading");
const errorText = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = input.value.trim();
  if (!username) return;

  profileDiv.classList.add("hidden");
  errorText.classList.add("hidden");
  loadingText.classList.remove("hidden");

  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    
    if (!userRes.ok) {
      throw new Error("User not found");
    }

    const userData = await userRes.json();
    const repoRes = await fetch(userData.repos_url);
    const repos = await repoRes.json();

    displayProfile(userData, repos);
  } catch (error) {
    errorText.classList.remove("hidden");
  } finally {
    loadingText.classList.add("hidden");
  }
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function displayProfile(user, repos) {
  profileDiv.innerHTML = `
    <img src="${user.avatar_url}" alt="avatar">
    <h2>${user.name || "No Name Available"}</h2>
    <p>${user.bio || "No bio available"}</p>
    <p>Joined: ${formatDate(user.created_at)}</p>
    <p>
      Portfolio: 
      <a href="${user.html_url}" target="_blank">
        ${user.html_url}
      </a>
    </p>

    <h3>Latest Repositories</h3>
    ${repos
      .slice(0, 5)
      .map(
        repo => `
        <div class="repo">
          <a href="${repo.html_url}" target="_blank">
            ${repo.name}
          </a>
          <p> ${repo.stargazers_count}</p>
          <p>Updated: ${formatDate(repo.updated_at)}</p>
        </div>
      `
      )
      .join("")}
  `;

  profileDiv.classList.remove("hidden");
}
