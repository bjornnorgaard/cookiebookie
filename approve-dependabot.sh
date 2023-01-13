echo "😎 Will approved succeeding PRs from dependabot"

pull_request_numbers=$(gh pr list --search "is:open is:pr -status:failure -review:approved author:app/dependabot" --json number --jq .[].number)

if [ -z "$pull_request_numbers" ]; then
    echo "👌 No open PRs from dependabot to approve"
    exit
fi

for number in $pull_request_numbers; do
    gh pr review $number --approve --body "@dependabot squash and merge"
done

echo "🚀 Done approving PRs from dependabot"
