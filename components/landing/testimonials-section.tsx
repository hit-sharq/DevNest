import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Content Creator",
    avatar: "/woman-content-creator.png",
    content:
      "DevNest helped me grow from 2K to 50K followers in just 6 months. The engagement is real and my community is thriving!",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Small Business Owner",
    avatar: "/asian-businessman-meeting.png",
    content:
      "Finally, a growth service that actually works. My restaurant's Instagram now brings in 30% of our new customers.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "Fitness Influencer",
    avatar: "/latina-fitness-woman.png",
    content:
      "The targeting is incredible. I'm connecting with people who are genuinely interested in fitness and wellness.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Loved by Creators Worldwide</h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Join thousands of successful creators who trust DevNest to grow their Instagram presence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                <p className="text-muted mb-6 leading-relaxed">"{testimonial.content}"</p>

                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
