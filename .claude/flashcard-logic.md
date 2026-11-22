// hooks/useFlashcardSession.ts
export function useFlashcardSession(slug: string) {
const { cards, gradeCard, getDueCards } = useProgressStore()
const phrases = getPhrasesBySlug(slug) // from lib/data

// On first visit, init all cards for this scenario
useEffect(() => {
phrases.forEach(p => {
if (!cards[p.id]) initCard(p.id)
})
}, [slug])

const dueCards = getDueCards(slug)

const [currentIndex, setCurrentIndex] = useState(0)
const [showBack, setShowBack] = useState(false)
const [showResponse, setShowResponse] = useState(false)

// Card face: front = English prompt, back = Japanese + romaji + responses

const current = dueCards[currentIndex]

function grade(score: 0 | 3 | 4 | 5) {
gradeCard(current.phraseId, score)
setShowBack(false)
setShowResponse(false)
setCurrentIndex(i => i + 1)
}

return { current, showBack, setShowBack, showResponse, setShowResponse, grade, total: dueCards.length, currentIndex }
}
