import { useEffect, useState } from "react"
import api from "../lib/axios"
import axios from "axios"
import toast from "react-hot-toast"
import { MapPin, Ticket, Calendar, Clock } from "lucide-react"
import type { CatalogEvent } from "../types"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../stores/authStore.ts"
type CatalogPageProps = {
    category: "movies" | "train" | "concert"
    eyebrow: string
    title: string
    description: string
}

const CatalogPage = ({ category, eyebrow, title, description }: CatalogPageProps) => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [items, setItems] = useState<CatalogEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isActive = true

        const loadItems = async () => {
            setIsLoading(true)

            try {
                const res = await api.get(`/catalog/${category}`)
                if (isActive) {
                    setItems(res.data.items || [])
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data?.message || `Failed to load ${title.toLowerCase()}`)
                }
            } finally {
                if (isActive) {
                    setIsLoading(false)
                }
            }
        }

        void loadItems()

        return () => {
            isActive = false
        }
    }, [category, title])

    const handleBookNow = (item: CatalogEvent) => {
        navigate(`/book/${item.id}`)
    }
    return (
        <div className="min-h-[calc(100vh-8rem)] bg-(--app-bg) px-4 py-10 text-(--app-fg)">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/30 sm:p-10">
                <div className="rounded-3xl border border-(--app-border) bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%),linear-gradient(135deg,rgba(24,24,27,0.95),rgba(9,9,11,0.95))] p-6 sm:p-8">
                    <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">{eyebrow}</p>
                    <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
                    <p className="mt-2 max-w-2xl text-sm text-(--app-muted)">{description}</p>
                </div>

                {isLoading ? (
                    <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-6 text-sm text-(--app-muted)">
                        Loading {title.toLowerCase()}...
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                            <article key={item.id} className="overflow-hidden rounded-3xl border border-(--app-border) bg-(--app-surface-2) shadow-lg shadow-black/20">
                                <div className="relative h-56 overflow-hidden">
                                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                </div>

                                <div className="space-y-4 p-5">
                                    <div>
                                        <h2 className="text-xl font-semibold">{item.title}</h2>
                                    </div>

                                    <div className="grid gap-3 text-sm text-(--app-muted)">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-(--app-accent)" />
                                            <span>{item.venue}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-(--app-accent)" />
                                                <span>{item.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-(--app-accent)" />
                                                <span>{item.time}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {item.details.map((detail) => (
                                            <span key={detail} className="rounded-full border border-(--app-border) bg-(--app-surface) px-3 py-1 text-xs text-(--app-fg)">
                                                {detail}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between gap-3 border-t border-(--app-border) pt-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Starting at</p>
                                            <p className="mt-1 text-2xl font-semibold">$ {item.price}</p>
                                        </div>

                                        {(!user || user.role === "user") && (
                                            <button onClick={() => handleBookNow(item)} type="button" className="inline-flex items-center gap-2 rounded-full bg-(--app-accent) px-4 py-2 text-sm font-semibold text-(--app-accent-fg) hover:bg-(--app-accent-hover)">
                                                <Ticket className="h-4 w-4" />
                                                Book now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CatalogPage