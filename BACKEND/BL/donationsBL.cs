using DTO;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BL
{
    public class donationsBL
    {
        //private static Donations donations;
        public static int AddDonations(Donations d)
        {
            //donations = d;
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                // if (d.MasterCategory == 0) d.MasterCategory = null;
                //מוסיפים תמיד?
                db.Donations.Add(Converters.DonationConverter.convertToDAL(d));
                try
                {
                    db.SaveChanges();
                    int code = db.Donations.ToArray().Last().donationCode;
                    d.donationCode = code;
                    BL.EmailService.SendMail("תרומתך התקבלה", code + "מספר התרומה", d.donorEmail);
                    CoordinationDonation(d);
                    return code;

                    //שליחת מייל
                }
                catch (DbEntityValidationException ex)
                {
                    foreach (var entityValidationErrors in ex.EntityValidationErrors)
                    {
                        foreach (var validationError in entityValidationErrors.ValidationErrors)
                        {
                            System.Diagnostics.Debug.WriteLine(
                            "Property: " + validationError.PropertyName + " Error: " + validationError.ErrorMessage);
                        }
                    }
                    System.Diagnostics.Debug.WriteLine("no");
                    return 0;
                }

            }
        }
        public static void CoordinationDonation(Donations d)
        {



            List<DAL.GMH> gMHs = new List<DAL.GMH>();
            List<DAL.RequestForLoan> requests = new List<DAL.RequestForLoan>();
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
      //          BL.EmailService.offerDonationMail("קבלת הצעה לתרומה", d, db.GMH.FirstOrDefault(g => g.GmhCode == 6002));

                requests = db.RequestForLoan.Where(r => r.ProductCode == d.ProductCode).ToList();
                //if (db.Donations.Contains(BL.Converters.DonationConverter.convertToDAL(d)))
                //{
                    requests.ForEach(r =>
                    {
                        if (db.DonationOffers.FirstOrDefault(dd => dd.DonationCode != d.donationCode || dd.UserCode != r.UserCode) != null)
                            requests.Remove(r);
                    });
          //      }
                gMHs = db.GMH.Where(g => g.CategoryCode == d.Category).ToList();
                BL.EmailService.offerDonationMail("קבלת הצעה לתרומה", d,  gMHs[0]);

                if (requests.Count() == 1)//אם יש רק אחד באותה קטגוריה
                {
                    BL.EmailService.offerDonationMail("קבלת הצעה לתרומה", d, db.GMH.FirstOrDefault(g => g.CategoryCode == d.Category));
                }
                else if (requests.Count() > 1)//אם יש יותר בודקים מרחק 
                {
                    requests.ForEach(r => {
                        foreach (DAL.GMH g in db.GMH)
                        {
                            if (r.UserCode == g.UserCode)
                                gMHs.Add(g);
                        };
                    });
                    foreach (DAL.GMH g in db.GMH)
                    {
                        if (BL.GoogleMaps.GetDistance(g.Adress, d.Adress) > 30)
                            gMHs.Remove(g);
                    }
                    if (gMHs.Count() == 0) { }//מה לעשות אם אין אף אחד בקרבה
                    else if (gMHs.Count() == 1)//אם יש אחד בקרבה גדולה
                    {
                        BL.EmailService.offerDonationMail("קבלת הצעה לתרומה", d, gMHs[0]);
                    }
                    else if (gMHs.Count() > 1)
                    {
                        gMHs = gMHs.Where(g => g.UserCode == (requests.OrderBy(g1 => g1.RequestDate).FirstOrDefault().UserCode)).ToList();
                        if (gMHs.Count() == 1)
                        {
                            BL.EmailService.SendMail("קבלת הצעה לתרומה", d.donationCode + "מספר התרומה", gMHs[0].e_mail);
                        }
                        //else if (gMHs.Count() > 1)
                        //{
                        //    gMHs = gMHs.Where(g => g.UserCode == (db.OPINIONS.OrderBy(o => o.Rating).FirstOrDefault().LandingCode)).ToList();
                        //}
                    }
                }
            }

        }
        public static void donationAnswer(bool b, int userCode, int donationCode)
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                if (b == false)
                {

                    db.DonationOffers.Add(new DAL.DonationOffers { UserCode = userCode, DonationCode = donationCode });
                    try
                    {
                        db.SaveChanges();

                    }
                    catch (DbEntityValidationException ex)
                    {
                        foreach (var entityValidationErrors in ex.EntityValidationErrors)
                        {
                            foreach (var validationError in entityValidationErrors.ValidationErrors)
                            {
                                System.Diagnostics.Debug.WriteLine(
                                "Property: " + validationError.PropertyName + " Error: " + validationError.ErrorMessage);
                            }
                        }
                        System.Diagnostics.Debug.WriteLine("no");

                    }
                    CoordinationDonation(BL.Converters.DonationConverter.convertToDTO(db.Donations.FirstOrDefault(d=>d.donationCode==donationCode)));


                }
                else RemoveDonation(BL.Converters.DonationConverter.convertToDTO(db.Donations.FirstOrDefault(d => d.donationCode == donationCode)));
            }
          
} 
        public static List<Donations> GetDonations()
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                return BL.Converters.DonationConverter.convertToDTOList(db.Donations.ToList());
            }

        }//פונקציה שמחזירה את כל התרומות
        public static Donations GetDonation(int code)
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                return BL.Converters.DonationConverter.convertToDTO(db.Donations.FirstOrDefault(d => d.donationCode == code));
            }

        }//פונקציה שמקבלת קוד תרומה ומחזירה את אותה תרומה
        public static bool RemoveDonation(Donations d)//פונקציה שמקבלת תרומה ומוחקת אותה מטבלת בתרומות
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                if (d != null) {
                    db.DonationOffers.RemoveRange(db.DonationOffers.Where(d1 => d.donationCode == d1.DonationCode).ToList());
                    db.Donations.Remove(db.Donations.FirstOrDefault(d1=>d.donationCode==d1.donationCode));
                }
                try
                {
                    db.SaveChanges();
                    return true;
                }
                catch (DbEntityValidationException ex)
                {
                    foreach (var entityValidationErrors in ex.EntityValidationErrors)
                    {
                        foreach (var validationError in entityValidationErrors.ValidationErrors)
                        {
                            System.Diagnostics.Debug.WriteLine(
                            "Property: " + validationError.PropertyName + " Error: " + validationError.ErrorMessage);
                        }
                    }
                    System.Diagnostics.Debug.WriteLine("no");
                    return false;
                }
            }
        }
        public static List<Donations> FilterDonations(int c, int tc, string adress)
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                List<Donations> donations = new List<Donations>();
                if (tc != 0)
                {
                    donations.AddRange(BL.Converters.DonationConverter.convertToDTOList(db.Donations.Where(d => d.Category == tc).ToList()));
                    if (adress != "" && adress != "undefind")
                    {
                        foreach (Donations d in donations)
                        {
                            if (BL.GoogleMaps.GetDistance(d.Adress, adress) > 20)
                                donations.Remove(d);
                        }


                    }
                }
                else if (c != 0)
                {
                    List<int> categories = db.CategoryGMH.Where(c1 => c1.MasterCategoryCode == c).Select(c1 => c1.CategoryCode).ToList();
                    donations.AddRange(BL.Converters.DonationConverter.convertToDTOList(db.Donations.Where(d => d.Category == c || categories.Contains(d.Category)).ToList()));
                if (adress != "" && adress != "undefined")
                {
                    foreach (Donations d in donations.ToList())
                    {
                        if (BL.GoogleMaps.GetDistance(d.Adress, adress) > 20)
                            donations.Remove(d);
                    }
               
               
                }
               
               }
                else
                {
                    foreach (DAL.Donations d in db.Donations)
                    {
                        if (BL.GoogleMaps.GetDistance(d.Adress, adress) < 20)
                            donations.Add(BL.Converters.DonationConverter.convertToDTO(d));
                    }
                }
                return donations;
            }
        }//פונקציה שמקבלת קריטריונים ומחזירה את התרומות המתאימות להם
        public static bool SaveChanges(Donations d)
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                db.Donations.FirstOrDefault(d1 => d1.donationCode == d.donationCode).donationName = d.donationName;
                db.Donations.FirstOrDefault(d1 => d1.donationCode == d.donationCode).Description = d.Description;
                db.Donations.FirstOrDefault(d1 => d1.donationCode == d.donationCode).Picture = d.Picture;
                try
                {
                    db.SaveChanges();
                    return true;
                }
                catch
                {
                    return false;
                }
            }
        }
    }
}

//using DTO;
//using System;
//using System.Collections.Generic;
//using System.Data.Entity.Validation;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace BL
//{
//    public class donationsBL
//    {
//        public static int AddDonations(Donations d)
//        {
//            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
//            {
//               // if (d.MasterCategory == 0) d.MasterCategory = null;
//               //מוסיפים תמיד?
//              //  db.Donations.Add(Converters.DonationConverter.convertToDAL(d));
//                try
//                {
//                    db.SaveChanges();

//                    //foreach (var item in db.RequestForLoan)
//                    //{
//                    //    ///if( תרומה מתאימה לITEM)
//                    //    BL.EmailService.offerDonationMail("תרומה תואמת לבקשתך", d.donationCode, db.USERS.Find(item.UserCode).E_mail);
//                    //}
//                    //int code = db.Donations.ToArray().Last().donationCode;//
//                    //BL.EmailService.SendMail("תרומתך התקבלה", code+"מספר התרומה",d.donorEmail);
//                    int code = db.Donations.ToArray().Last().donationCode;

//                    //   BL.EmailService.SendMail("תרומתך התקבלה", code+"מספר התרומה",d.donorEmail);
//                    List<DAL.GMH> gMHs = new List<DAL.GMH>();
//                    List<DAL.RequestForLoan> requests = new List<DAL.RequestForLoan>();

//                    requests = db.RequestForLoan.Where(r => r.ProductCode == d.ProductCode).ToList();
//                    gMHs = db.GMH.Where(g => g.CategoryCode == d.Category).ToList();
//                    if (requests.Count() == 0)//אם אין גמח מאותה קטגוריה
//                    {
//                        db.Donations.Add(Converters.DonationConverter.convertToDAL(d));
//                    }
//                    else if (requests.Count() == 1)//אם יש רק אחד באותה קטגוריה
//                    {
//                        BL.EmailService.SendMail("קבלת הצעה לתרומה", code + "מספר התרומה", db.GMH.FirstOrDefault(g => g.CategoryCode == d.Category).e_mail);
//                    }
//                    else if(requests.Count() > 1)//אם יש יותר בודקים מרחק 
//                    {
//                        foreach (DAL.GMH g in db.GMH)
//                        {
//                            if (BL.GoogleMaps.GetDistance(g.Adress, d.Adress) < 30)
//                                gMHs.Add(g);
//                        }
//                        if(gMHs.Count() == 0) { }//מה לעשות אם אין אף אחד בקרבה
//                        else if(gMHs.Count()==1)//אם יש אחד בקרבה גדולה
//                        {
//                            BL.EmailService.SendMail("קבלת הצעה לתרומה", code + "מספר התרומה", gMHs[0].e_mail);
//                        }
//                        else if(gMHs.Count() > 1)
//                        {
//                          gMHs=  gMHs.Where(g => g.UserCode == (requests.OrderBy(g1 => g1.RequestDate).FirstOrDefault().UserCode)).ToList();
//                            if (gMHs.Count() == 1)
//                            {
//                                BL.EmailService.SendMail("קבלת הצעה לתרומה", code + "מספר התרומה", gMHs[0].e_mail);
//                            }
//                            //else if (gMHs.Count() > 1)
//                            //{
//                            //    //gMHs = gMHs.Where(g => g.UserCode == (db.OPINIONS.OrderBy(o=>o.Rating).FirstOrDefault().LandingCode)).ToList();
//                            //}
//                        }
//                    }

//                    return code;

//               //שליחת מייל
//                }
//                catch (DbEntityValidationException ex)
//                {
//                    foreach (var entityValidationErrors in ex.EntityValidationErrors)
//                    {
//                        foreach (var validationError in entityValidationErrors.ValidationErrors)
//                        {
//                            System.Diagnostics.Debug.WriteLine(
//                            "Property: " + validationError.PropertyName + " Error: " + validationError.ErrorMessage);
//                        }
//                    }
//                    System.Diagnostics.Debug.WriteLine("no");
//                    return 0;
//                }

//            }
//        }
//        public static List<Donations> GetDonations()
//        {
//            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
//            {
//                return BL.Converters.DonationConverter.convertToDTOList(db.Donations.ToList());
//            }

//        }
//        public static Donations GetDonation(int code)
//        {
//            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
//            {
//                return BL.Converters.DonationConverter.convertToDTO(db.Donations.FirstOrDefault(d => d.donationCode==code));
//            }

//        }
//        public static bool RemoveDonation(Donations d)
//        {
//            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
//            {
//                if(d!=null)
//                db.Donations.Remove(BL.Converters.DonationConverter.convertToDAL(d));
//                try
//                {
//                    db.SaveChanges();
//                    return true;
//                }
//                catch (DbEntityValidationException ex)
//                {
//                    foreach (var entityValidationErrors in ex.EntityValidationErrors)
//                    {
//                        foreach (var validationError in entityValidationErrors.ValidationErrors)
//                        {
//                            System.Diagnostics.Debug.WriteLine(
//                            "Property: " + validationError.PropertyName + " Error: " + validationError.ErrorMessage);
//                        }
//                    }
//                    System.Diagnostics.Debug.WriteLine("no");
//                    return false;
//                }
//            }
//        }
//        public static List<Donations> filterDonations(int c,int tc,string adress)
//        {
//            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
//            {
//                List<Donations> donations = new List<Donations>();
//                    if (tc != 0)
//                    {


//                        donations.AddRange(BL.Converters.DonationConverter.convertToDTOList(db.Donations.Where(d => d.Category == tc).ToList()));
//                    if (adress != "" && adress != "undefind")
//                    {
//                        foreach (Donations d in donations)
//                        {
//                            if (BL.GoogleMaps.GetDistance(d.Adress, adress) > 50)
//                                donations.Remove(d);
//                        }


//                    }
//                }
//                 //   else if (c != 0)
//                 //   {
//                 //   donations.AddRange(BL.Converters.DonationConverter.convertToDTOList(db.Donations.Where(d => d.MasterCategory == c).ToList()));
//                 //   if (adress != "" && adress != "undefined")
//                 //   {
//                 //       foreach (Donations d in donations.ToList())
//                 //       {
//                 //           if (BL.GoogleMaps.GetDistance(d.Adress, adress) > 50)
//                 //               donations.Remove(d);
//                 //       }
//                 //
//                 //
//                 //   }

//              //  }
//                else
//                    {
//                        foreach (DAL.Donations d in db.Donations)
//                        {
//                            if (BL.GoogleMaps.GetDistance(d.Adress, adress) < 50)
//                                donations.Add(BL.Converters.DonationConverter.convertToDTO(d));
//                        }
//                }
//                return donations;
//            }
//        }
//        public static bool saveChanges(Donations d)
//        {
//            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
//            {
//                db.Donations.FirstOrDefault(d1 => d1.donationCode == d.donationCode).donationName = d.donationName;
//                db.Donations.FirstOrDefault(d1 => d1.donationCode == d.donationCode).Description = d.Description;
//                db.Donations.FirstOrDefault(d1 => d1.donationCode == d.donationCode).Picture = d.Picture;
//                try
//                {
//                    db.SaveChanges();
//                    return true;
//                }
//                catch
//                {
//                    return false;
//                }
//            }
//        }
//    }

//    public class CopyOfdonationsBL
//    {
//        public static int AddDonations(Donations d)
//        {
//            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
//            {
//                //if (d.MasterCategory == 0) d.MasterCategory = null;

//                db.Donations.Add(Converters.DonationConverter.convertToDAL(d));
//                try
//                {
//                    db.SaveChanges();

//                    foreach (var item in db.RequestForLoan)
//                    {
//                        ///if( תרומה מתאימה לITEM)
//                        BL.EmailService.offerDonationMail("תרומה תואמת לבקשתך", d.donationCode, db.USERS.Find(item.UserCode).E_mail);
//                    }
//                    int code = db.Donations.ToArray().Last().donationCode;//
//                    //BL.EmailService.SendMail("תרומתך התקבלה", code+"מספר התרומה",d.donorEmail);
//                    return code;

//                    //שליחת מייל
//                }
//                catch (DbEntityValidationException ex)
//                {
//                    foreach (var entityValidationErrors in ex.EntityValidationErrors)
//                    {
//                        foreach (var validationError in entityValidationErrors.ValidationErrors)
//                        {
//                            System.Diagnostics.Debug.WriteLine(
//                            "Property: " + validationError.PropertyName + " Error: " + validationError.ErrorMessage);
//                        }
//                    }
//                    System.Diagnostics.Debug.WriteLine("no");
//                    return 0;
//                }

//            }
//        }
//        public static List<Donations> GetDonations()
//        {
//            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
//            {
//                return BL.Converters.DonationConverter.convertToDTOList(db.Donations.ToList());
//            }

//        }
//        public static Donations GetDonation(int code)
//        {
//            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
//            {
//                return BL.Converters.DonationConverter.convertToDTO(db.Donations.FirstOrDefault(d => d.donationCode == code));
//            }

//        }
//        public static bool RemoveDonation(Donations d)
//        {
//            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
//            {
//                db.Donations.Remove(BL.Converters.DonationConverter.convertToDAL(d));
//                try
//                {
//                    db.SaveChanges();
//                    return true;
//                }
//                catch (DbEntityValidationException ex)
//                {
//                    foreach (var entityValidationErrors in ex.EntityValidationErrors)
//                    {
//                        foreach (var validationError in entityValidationErrors.ValidationErrors)
//                        {
//                            System.Diagnostics.Debug.WriteLine(
//                            "Property: " + validationError.PropertyName + " Error: " + validationError.ErrorMessage);
//                        }
//                    }
//                    System.Diagnostics.Debug.WriteLine("no");
//                    return false;
//                }
//            }
//        }
//        public static List<Donations> filterDonations(int c, int tc, string adress)
//        {
//            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
//            {
//                List<Donations> donations = new List<Donations>();
//                if (tc != 0)
//                {


//                    donations.AddRange(BL.Converters.DonationConverter.convertToDTOList(db.Donations.Where(d => d.Category == tc).ToList()));
//                }
//                //else if (c != 0)
//                //{
//                //    donations.AddRange(BL.Converters.DonationConverter.convertToDTOList(db.Donations.Where(d => d.MasterCategory == c).ToList()));

//                //}
//                if (adress != "undefined")
//                {
//                    foreach (DAL.Donations d in db.Donations)
//                    {
//                        if (BL.GoogleMaps.GetDistance(d.Adress, adress) < 50)
//                            donations.Add(BL.Converters.DonationConverter.convertToDTO(d));
//                    }
//                }
//                return donations;
//            }
//        }
//        public static bool saveChanges(Donations d)
//        {
//            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
//            {
//                db.Donations.FirstOrDefault(d1 => d1.donationCode == d.donationCode).donationName = d.donationName;
//                db.Donations.FirstOrDefault(d1 => d1.donationCode == d.donationCode).Description = d.Description;
//                db.Donations.FirstOrDefault(d1 => d1.donationCode == d.donationCode).Picture = d.Picture;
//                try
//                {
//                    db.SaveChanges();
//                    return true;
//                }
//                catch
//                {
//                    return false;
//                }
//            }
//        }
//    }
//}




