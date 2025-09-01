# Configurar Proteção de Branch para o repositório gastofacil
$repoOwner = "lincon-cardoso"
$repoName = "gastofacil"
$branchName = "main"

# Corpo da requisição em JSON
$body = @{
  required_status_checks = @{
    strict = $true
    contexts = @(
      "Codacy/PR Quality Review",
      "Codacy/PR Coverage"
    )
  }
  enforce_admins = $true
  required_pull_request_reviews = @{
    dismiss_stale_reviews = $true
    require_code_owner_reviews = $false
    required_approving_review_count = 1
  }
  restrictions = $null
} | ConvertTo-Json -Depth 5

# Configurar proteção de branch usando o corpo JSON
$body | gh api --method PUT `
  -H "Accept: application/vnd.github.v3+json" `
  "/repos/$repoOwner/$repoName/branches/$branchName/protection" `
  --input -
