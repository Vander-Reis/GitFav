import { GithubUser } from './GitHubUsers.js'

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(
        (entry) => entry.login.toUpperCase() === username.toUpperCase()
      )

      if (userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    )

    this.entries = filteredEntries

    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onAdd()
  }

  onAdd() {
    const addButton = this.root.querySelector('.search-github')

    addButton.onclick = () => {
      const { value } = this.root.querySelector('#search-git')

      
      this.add(value)
      
      document.querySelector('#search-git').value = ''
    }
  }

  verification() {
    const verication = this.entries.length

    if(verication === 0) {
        this.root.querySelector('tfoot').classList.add('not-favorited')
    } else {
        this.root.querySelector('tfoot').classList.remove('not-favorited')
    }
  }

  update() {
    this.removeAll()
    this.verification()

    this.entries.forEach( user => {
      const row = this.createRow()

      row.querySelector('.users img').src = `https://github.com/${user.login}.png`
      row.querySelector('.users img').alt = `imagem de ${user.name}`
      row.querySelector('.users a').href = `https://github.com/${user.login}`
      row.querySelector('.users p').textContent = user.name
      row.querySelector('.users span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('td .remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja remover está linha?')

        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    const content = `
    <td class='users'>
        <img src='https://github.com/vander-reis.png' alt=''>
        <a href='https://github.com/vander-reis' target='_blank'>
            <p>Vander Reis</p>
            <span>Vander-Reis</span>
        </a>

    </td>
        <td class='repositories'>
            76
        </td>
    <td class='followers'>
        1000
    </td>
    <td><button class='remove'>Remover</button></td>
    `

    tr.innerHTML = content

    return tr
  }

  removeAll() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }
}
