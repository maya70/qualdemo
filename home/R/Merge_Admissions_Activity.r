X2014 <- read.csv("C:/Bitnami/wampstack-7.1.13-1/apache2/htdocs/Qualdashv1/data/picanet_activity/2014.csv", head=T)
ADM2014 <- read.csv("C:/Bitnami/wampstack-7.1.13-1/apache2/htdocs/Qualdashv1/data/picanet_admission/2014.csv", head=T)
M <- merge(ADM2014, X2014, by=c('eventidscr'), all.x=T)

d = data.frame(M$eventidscr, M$addate, M$hrggroup, M$unplannedextubation.y, M$invventet, M$invventtt, M$intubation, M$ventilationstatus, M$avsjet, M$avsosc)

colnames(d) <- c('eventidscr', 'addate', 'hrggroup', 'unplannedextubation', 'invventet', 'invventtt', 'intubation', 'ventilationstatus', 'avsjet', 'avsosc' )

write.csv(d, "shortactiv2014.csv")