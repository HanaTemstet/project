using DTO;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BL
{
    public class gmhBL
    {
        public static bool addGMH(GMH gmh)
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                db.GMH.Add(Converters.GMHConverter.convertToDal(gmh));
                try
                {
                    db.SaveChanges();
                    NeedsGmhim ng = new NeedsGmhim();
                    ng.category = gmh.CategoryCode;
                    ng.Adress = gmh.Adress;
                    needsGmhim.remove(ng);
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
        public static bool delete(GMH gmh)
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                db.PRODUCTtoGMH.RemoveRange(db.PRODUCTtoGMH.Where(p => p.GmhCode == gmh.GmhCode));
                List<DAL.LENDINGS> list = new List<DAL.LENDINGS>();
                List<DAL.Images> list1 = new List<DAL.Images>();
                foreach (var l in db.LENDINGS)
                {
                    foreach (var p in db.PRODUCTtoGMH)
                    {
                        if (l.ProductCode == p.ProductCodeToGMH && p.GmhCode == gmh.GmhCode)
                            list.Add(l);
                    }
                }
                foreach (var i in db.Images)
                {
                    foreach (var p in db.PRODUCTtoGMH)
                    {
                        if (i.ProductCodeToGMH == p.ProductCodeToGMH && p.GmhCode == gmh.GmhCode)
                            list1.Add(i);
                    }

                }
                db.LENDINGS.RemoveRange(list);
                db.Images.RemoveRange(list1);
                db.GMH.Remove((db.GMH.SingleOrDefault(g => g.GmhCode == gmh.GmhCode)));
                try
                {
                    db.SaveChanges();
                    System.Diagnostics.Debug.WriteLine("yes");
                    return true;
                }
                catch (DbEntityValidationException ex)
                {
                    //הדפסת שגיאה בקישור לדאטא בס
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
        public static GMH[] getAllGmhs()
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                return BL.Converters.GMHConverter.convertToDTOarray((db.GMH.Select(g => g).ToArray()));
            }
        }
        public static GMH getGmhByGmhCode(GMH gmhCode)
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                System.Diagnostics.Debug.WriteLine(gmhCode);
               return BL.Converters.GMHConverter.convertToDTO(db.GMH.First(s => s.GmhCode == gmhCode.GmhCode));
            }
        }
        public static GMH[] getMyGmhim(User user)
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                return BL.Converters.GMHConverter.convertToDTOarray((db.GMH.Where(g => g.UserCode == user.UserCode).ToArray()));
            }
        }
        public static bool saveChange(GMH gmh)
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                object a = db.GMH.FirstOrDefault(g => gmh.GmhCode == g.GmhCode);
                db.GMH.FirstOrDefault(g => gmh.GmhCode == g.GmhCode).GmhName = gmh.GmhName;
                db.GMH.FirstOrDefault(g => gmh.GmhCode == g.GmhCode).Phone = gmh.Phone;
                db.GMH.FirstOrDefault(g => gmh.GmhCode == g.GmhCode).e_mail = gmh.e_mail;
                db.GMH.FirstOrDefault(g => gmh.GmhCode == g.GmhCode).comments = gmh.comments;
                db.GMH.FirstOrDefault(g => gmh.GmhCode == g.GmhCode).Adress = gmh.Adress;
                try
                {
                    db.SaveChanges();
                    System.Diagnostics.Debug.WriteLine("yes");
                    return true;
                }
                catch (DbEntityValidationException ex)
                {
                    //הדפסת שגיאה בקישור לדאטא בס
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
        public static CategoryGMH[] getCategoriesForGmach(CategoryGMH masterGmachCode)
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                List<CategoryGMH> a = BL.Converters.CategoryGMHConvereter.convertToDTOList(db.CategoryGMH.Where(s => s.MasterCategoryCode == masterGmachCode.CategoryCode).ToList());
                return (a.ToArray<CategoryGMH>());
            }
        }
        public static CategoryGMH[] getCategories()
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                List<CategoryGMH> a = BL.Converters.CategoryGMHConvereter.convertToDTOList(db.CategoryGMH.Where(s => s.MasterCategoryCode == null).ToList());
                System.Diagnostics.Debug.WriteLine(a.ToArray<CategoryGMH>());
                return (a.ToArray<CategoryGMH>());
            }
        }
        public static List<GMH> searchGMH(string text, int category, int tatCategory, double CurrentLocation1, double CurrentLocation2, string location, int distance)
        {
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                List<GMH> gmhim = new List<GMH>();
                if (text != "")
                    foreach (var product in db.Products)
                    {
                        if (product.Productname.Equals(text))
                        {
                            foreach (var productToGmh in db.PRODUCTtoGMH)
                            {
                                if (productToGmh.ProductCode == product.ProductCode)
                                {
                                    foreach (var gmh in db.GMH.Where(g=> g.GmhCode == productToGmh.GmhCode))
                                    {
                                    gmhim=checkDistance(gmhim, CurrentLocation1, CurrentLocation2, location,BL.Converters.GMHConverter.convertToDTO(gmh), distance);
                                    }
                                }
                            }
                        }
                    }
                if (db.GMH.Where(g => g.CategoryCode == tatCategory) != null)
                    foreach (DAL.GMH gmh in db.GMH.Where(g => g.CategoryCode == tatCategory))
                    {
                     gmhim=checkDistance(gmhim, CurrentLocation1, CurrentLocation2, location, BL.Converters.GMHConverter.convertToDTO(gmh), distance);
                    }
              
                    if (category != 0) {
                    List<int> categories = db.CategoryGMH.Where(c => c.MasterCategoryCode == category).Select(c=> c.CategoryCode).ToList();
                            if (db.GMH.Where(g => g.CategoryCode == category && categories.Contains(g.CategoryCode)) != null  )
                    foreach (DAL.GMH gmh in db.GMH.Where(g => g.CategoryCode == category || categories.Contains(g.CategoryCode)))
                    {
                      gmhim=checkDistance(gmhim, CurrentLocation1, CurrentLocation2, location,BL.Converters.GMHConverter.convertToDTO(gmh), distance);
                    }
                
                }
                if (gmhim.Count == 0)
                {
                    NeedsGmhim ng = new NeedsGmhim();
                    if (CurrentLocation1 != 0)
                        ng.Adress = CurrentLocation1 + " " + CurrentLocation2;
                   else ng.Adress = location;
                    if (text != "")
                        ng.category =
                            db.Products.FirstOrDefault
                            (p => p.Productname .Equals( text)).CategoryCode;
                    else
                    {
                        if (tatCategory != 0)
                            ng.category = tatCategory;
                        else
                            ng.category = category;
                    }
                    needsGmhim.add(ng);
                }
                return gmhim.Distinct().ToList();
            }
        }
        public static List<GMH> checkDistance(List<GMH> gmhim,double currl1,double currl2,string location,GMH gmh,int distance)
        {
            if (currl1 != 0)
            {
                if (BL.GoogleMaps.GetDistance(gmh.Adress, Convert.ToString(currl1 + " " + currl2)) < distance)
                {
                    gmhim.Add(gmh);
                }
            }
            else if (BL.GoogleMaps.GetDistance(gmh.Adress, location) < distance)
                gmhim.Add(gmh);
            else
                gmhim.Add(gmh);
            return gmhim;
        }
        public static bool saveChangesInGmhim(User u)
        {
            List<GMH> myGmhim = new List<GMH>();
            using (DAL.Charity_DBEntities db = new DAL.Charity_DBEntities())
            {
                foreach (DAL.GMH g in db.GMH.Where(g => g.UserCode == u.UserCode).ToList())
                {
                    g.e_mail = u.E_mail;
                    g.Phone = u.Phone;
                    g.Adress = u.Adress;
                }
                try { db.SaveChanges(); return true; }
                catch { return false; }
            
            }
        }
    }
}
